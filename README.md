# LA Report Server Homepage API

The ITaLI Learning Analytics report server has a homepage that lets users browse the suite of apps and dashboards we offer.

The homepage is a little React app that shows a user the apps they currently have access to, and allows them to request access to others.

We need an API situated on the report server to do the following:

1. Read the username of the person accessing the page. The report server requires single-sign on authentication and Apache inserts the UQ username 
  of the user into the request headers sent by the user's browser. For this reason, we need an API sitting on the report server itself so that the username
  can be extracted from the header. This wouldn't be true if the API were an AWS Lambda.

2. Query our Postgres DB to find the list of apps that the user does and does not have access to.

3. Invoke the AWS SES to send an email to learninganalytics@uq.edu.au when an access request form is submitted.

Note that since the report server is SSO authenticated, only users with valid UQ credentials will be able to hit this API in the first place.

## Changelog (v1.0.0)

- This version is the initial release.

## Environment

I'm playing around with [Fresh](https://fresh.deno.dev/) for this one. Initially I tried doing the whole homepage in Fresh, but since the 
framework is still in early days (currentl v1.1.1), it really only handles deployment using Deno Deploy. Since we want to stick it on our own 
server and have it run through a reverse proxy, we would need to pass it a custom root path. Unfortunately, that isn't supported at the moment 
(I've logged a feature request for it). So for the time being, we'll do the API in Fresh, the homepage in React, and come back to it later.

Bottom line, we need the Deno environment on the report server: [https://deno.land/manual@v1.26.0/getting_started/installation](https://deno.land/manual@v1.26.0/getting_started/installation)

## Prerequisites

1. The report server must have docker installed.

2. The report server must have Deno installed.

3. The Apache webserver must have the `/api/app-list` routing extension mapped to port 9001.

4. The superuser profile needs to have the following environment variables set (`/root/.bashrc`):
    - `report_server_aws_key`
    - `report_server_aws_secret`
    - `POSTGRES_HOST`
    - `POSTGRES_USER`
    - `POSTEGRS_PWD`

The AWS credentials are required for invoking the SES client; the Postgres credentials for connecting to our database. 

## Deployment

Clone this repo to the report server. Run 

```
make docker-container
make start-api
```

This should start the container running in detached mode and listening on port 9001 with the --restart flag passed.

## Usage

### GET

If you hit (reports.itali.edu.au/api/app-list)[reports.itali.edu.au/api/app-list] with a GET request, it will return a payload containing:
    - username (str) - UQ login for the user, 
    - userAppList (list) - list of app objects the user is authorized to use,
    - remainingAppList (list) - list of app objects the user is not authorized for,
    - fullAppList (list) - the full list of apps we offer.

The report server homepage takes this payload, displays a 'My Dashboards (username)' card deck, and an 'Other Dashboards' card deck where the 
user has the ability to request access to those apps.

### POST

A POST request is made by the Request Access form. It sends an email to learninganalytics@uq.edu.au. You must pass it a payload containing:
    - fromAddress (str) - the email address of the user sending the access request. They will be CCed in the email.
    - subject (str) - email subject line saying what app they're requesting access to.
    - message (str) - email message body.

If the POST request fails, the user should be alerted in the homepage. If it succeeeds, both LA and the user will receive an email.
 