const AWS = require('aws-sdk');
const crypto = require('crypto');

const db = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.TABLE_NAME;

module.exports.createUrl = async (event) => {
  const { originalUrl } = JSON.parse(event.body);
  const shortId = crypto.randomBytes(3).toString('hex');

  await db.put({
    TableName: TABLE,
    Item: { shortId, originalUrl },
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ shortUrl: `https://${event.headers.Host}/${shortId}` }),
  };
};

module.exports.getUrl = async (event) => {
  const { shortId } = event.pathParameters;

  const result = await db.get({
    TableName: TABLE,
    Key: { shortId },
  }).promise();

  if (!result.Item) {
    return { statusCode: 404, body: 'Not Found' };
  }

  return {
    statusCode: 301,
    headers: { Location: result.Item.originalUrl },
  };
};
