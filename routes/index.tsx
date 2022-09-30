// ----------------------------------------------------------------------------
// API
//
// GET:
// Returns a payload containing the username, card list accessible to the 
// user, card list not accessible, and full card list.
// 
// OPTIONS:
// For preflight.
// 
// POST:
// Ingests a payload containing fromAddress, subject, and message.
// Sends an email to learninganalytics@uq.edu.au.
// 
// Ideally, we'd use the full Fresh app, but at the moment it doesn't handle
// custom root paths. Until then, we use this API and have it called by the 
// react app.
// 
// ----------------------------------------------------------------------------
// Libraries

// Postgres
import { Client } from "https://deno.land/x/postgres/mod.ts";

// AWS email client
import { 
  SESClient,
  SendEmailCommand
 } from "https://deno.land/x/aws_sdk@v3.32.0-1/client-ses/mod.ts";

// Structure email parameters correctly
import { constructEmail } from "../functions/email_constructor.js";

// ----------------------------------------------------------------------------
// Globals

// Environment variables: AWS
const AWS_KEY = Deno.env.get('report_server_aws_key');
const AWS_SECRET = Deno.env.get('report_server_aws_secret');

// Environment variables: Postgres
const POSTGRES_HOST = Deno.env.get('POSTGRES_HOST');
const POSTGRES_USER = Deno.env.get('POSTGRES_USER');
const POSTGRES_PWD = Deno.env.get('POSTGRES_PWD');

// AWS SES Client
const REGION = 'ap-southeast-2';
const FROM_ADDRESS = 'learninganalytics@uq.edu.au';

const ses = new SESClient({
  region: REGION,
  credentials: {
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET,
  }
});

// ----------------------------------------------------------------------------
// API

export const handler: Handlers = {
  // This API has GET, OPTONS, and POST methods.
  async GET(req, ctx) {
    // When a GET request is made, we look for the SSO username inserted into
    // the request header by Apache. We then connect to our Postgres database
    // and find:
    //   1. The list of apps this user has access to,
    //   2. The full list of apps in our suite.
    // We then return an object containing the username, the access list,
    // the remaining apps list, and the full app list.

    // Declare variables
    var username = req.headers.get('username');
    var fullAppList;
    var userAppList;
    var remainingAppList;
       
    // Instantiate a postgres client and connect.
    const pgClient = new Client({
        database: "dash_app_auth",
        hostname: POSTGRES_HOST,
        user: POSTGRES_USER,
        password: POSTGRES_PWD,
        port: 5432,
      });

    await pgClient.connect();
      
    // Read in the app list
    fullAppList = await pgClient
        .queryObject(`
        SELECT CAST(id AS VARCHAR),
        title,
        description,
        routing_extension,
        logo
        FROM app_description;
        `);
    fullAppList = fullAppList.rows;
    
    // If username is non-null, read in apps they can access.
    if (username) {
      // Get the list of app descriptions that the user has access to.
      userAppList = await pgClient
      .queryObject(`
      SELECT CAST(app_id AS VARCHAR) as id,
             title,
             description,
             routing_extension,
             logo
      FROM app_description ad
      JOIN (
        SELECT app_id
        FROM authorized_users
        WHERE username = '${username}'
      ) au
      ON ad.id = au.app_id;
      `);
      
    // Get the list of rows returned by each query.
    // Construct the 'remainingAppList' by set differencing
    // fullAppList - userAppList.
    userAppList = userAppList.rows;
    remainingAppList = fullAppList.filter(x => {
      return (
        !userAppList
        .map(y => y.id)
        .includes(x.id)
        );
      });

    }
    // Close connection to Postgres
    await pgClient.end();
    
    // Bundle object
    const accessData = {
      "username": username,
      "fullAppList": fullAppList,
      "userAppList": userAppList,
      "remainingAppList": remainingAppList,
    };

    return new Response(JSON.stringify(accessData));
  },

  OPTIONS(req, ctx) {
    // For preflight
    return new Response(null, {
      'status': 200,
      'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST'
        },
      }
    );
  },
  
  async POST(req, ctx) {
    // Used by Request Access form to send email to learning analytics.
    // fromAddress, subject, and message must be in the payload of the POST
    // request.
    
    try {
      const payload = await req.json();
      console.log(payload);

      // Configure the email to be sent with AWS SES.
      const emailParams = constructEmail(payload);
      const command = new SendEmailCommand(emailParams);

      // Send the email and retrieve the status code.
      const resp = await ses.send(command);
      const status = resp['$metadata']['httpStatusCode'];

      // If the invocation works correctly and gives status 200, return a 200
      // status from to our POST request. Otherwise return a 400.
      if (status == 200) {
        console.log('Successfully sent email.');
        return new Response(JSON.stringify('Success!'), {
          'status': 200,
        });
      } else {
        return new Response(JSON.stringify(resp), {
          'status': 400,
        });
      }
    } catch (error) {
      console.log(error);
      return new Response(JSON.stringify(error), {
        'status': 400,
      });
    };
  }
};
