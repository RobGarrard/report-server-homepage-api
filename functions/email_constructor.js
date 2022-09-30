
export function constructEmail({
    fromAddress,
    subject,
    message,
    }
) {
    // Build a params object that will be passed to the aws-sdk email
    // constructor.
    const emailParams = {
        Destination: {
            CcAddresses: [
                fromAddress,
            ],
            ToAddresses: [
                'learninganalytics@uq.edu.au',
            ],
        },
        Message: {
            Body: {
                Text: {
                Charset: "UTF-8",
                Data: message,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: 'learninganalytics@uq.edu.au',
        ReplyToAddresses: [
            fromAddress
        ],
    };

    return emailParams;    
}