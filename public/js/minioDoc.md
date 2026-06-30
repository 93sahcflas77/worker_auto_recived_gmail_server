const Minio = require('minio');
const https = require("https");

const client = new Minio.Client({
    endPoint: "localhost", // Server hostname.
    port: 9000, // Server port  
    useSSL: false, // HTTPS or HTTP
    accessKey: "admin", // Access key
    secretKey: "StrongPassword@123", // Secret key
    region: "ap-south-1", // Bucket region but options
    pathStyle: true, // Force path-style requests but options
    pathStyle: 128 _ 1024 _ 1024, // Multipart upload chunk size but options
    sessionToken: undefined, // STS temporary token but options
    transport: new https.Agent({ // Custom HTTP/HTTPS agent but options
        keepAlive: true,
        maxSockets: 200,
    }),
});

client.host // Stores the MinIO/S3 server hostname.
client.port // Stores the server port.
client.protocol // Stores the communication protocol.
client.transport // Stores the HTTP/HTTPS transport agent.
client.regionMap // Internal cache of bucket regions.
client.anonymous // Indicates whether authentication is disabled.
client.accessKey // Stores the Access Key.  
client.secretKey // Stores Secret Key.

// BUCKET OPERATIONS
await client.makeBucket(bucketName, region); // Creates a new bucket.  
await client.bucketExists(bucketName); // Checks whether a bucket exists. Return Value:- true/false
await client.removeBucket(bucketName); // Deletes an empty bucket. Return Value:- undefined
await client.listBuckets(); // Returns all buckets. Return Value:- Array<{ name, creationDate }>

const policy = {
    version: "2012-10-17", // Policy language version
    statement: [ // List of policy rules
        {
            "Sid": "PublicRead", // Unique identifier for the statement Ex:- AllowImageDownloag
            "Effect": "Allow", // Determines whether permission is granted. Value:- Allow/Deny Allow:- Access permitted. | Deny:- Access denied.
            "Principal": "_", // Who can access.
            "Action": ["s3:GetObject"], // What operations are allowed. [ "s3:GetObject", "s3:PutObject" ]
            "Resource": ["arn:aws:s3:::photos/_"], // Which bucket/object is affected.
            "Condition": { // Extra restrictions. Optional.
                "IpAddress": { // Restrict access based on IP address.
                    "aws:SourceIp": "192.168.1.10/32", // Allow access only from this IP address.
                    "aws:SourceIp": ["192.168.1.10/32", "10.0.0.1/32"] // Multiple IPs
                },
                "bool": { // Restrict access based on boolean conditions.
                    "aws:SecureTransport": "true" // Allow access only over HTTPS.
                },
                "StringLike": { // Restrict access based on string matching.
                    "s3:prefix": "home/", // Allow access only to objects with this prefix.
                    "s3:delimiter": "/", // Allow access only to objects with this delimiter.
                    "s3:objectkey": "\*.jpg"
                }
            }
        }
    ],
}

await client.setBucketPolicy(bucketName, JSON.stringify(policy)); // Sets a bucket policy. Return Value:- undefined
await client.getBucketPolicy(bucketName); // Returns bucket policy. Return:- Promise<string>
await client.removeBucketPolicy(bucketName); // Removes bucket policy. Return Value:- undefined
const tags = { // Bucket tags as key-value pairs.
    "project": "myproject",
    "env": "production"
}
await client.setBucketTagging(bucketName, tags); // Adds tags to bucket.
await client.getBucketTagging(bucketName); // Returns bucket tags. Return Value:- Promise<{ [key: string]: string }>
await client.removeBucketTagging(bucketName); // Deletes all bucket tags. Return Value:- undefined
await client.setBucketNotification(bucketName, config); // Configures bucket notifications. Return Value:- undefined
// {
// QueueConfigurations: [],
// TopicConfigurations: [],
// CloudFunctionConfigurations: []
// }
await client.getBucketNotification(bucketName); // Returns bucket notification configuration. Return Value:- Promise<NotificationConfiguration>
await client.removeBucketNotification(bucketName); // Removes bucket notifications. Return Value:- undefined
await client.setBucketEncryption(bucketName, { // setBucketEncryption Retrun Value:- undefined
    Rule: {
        ApplyServerSideEncryptionByDefault: {
            SSEAlgorithm: "AES256" // Server-side encryption algorithm. Value:- AES256 or aws:kms
        }
    }
})
await client.getBucketEncryption(bucketName); // Returns bucket encryption configuration. Return Value:- Promise<ServerSideEncryptionConfiguration>
await client.removeBucketEncryption(bucketName); // Removes bucket encryption. Return Value:- undefined
await client.setBucketVersioning(bucketName, { Status: "Enabled" }); // Enables bucket versioning. Return Value:- undefined
await client.getBucketVersioning(bucketName); // Returns bucket versioning status. Return Value:- Promise<{ Status: "Enabled" | "Suspended" }>

// setBucketLifecycle() is used to define automatic lifecycle management rules for objects stored in a bucket.

// Instead of manually deleting or managing old files, MinIO can automatically:

// Delete old files
// Expire objects after a number of days
// Remove incomplete multipart uploads
// Manage object versions (when versioning is enabled)
await client.setBucketLifecycle(bucketName, lifecycleConfig); // setBucketLifecycle() is used to define automatic lifecycle management rules for objects stored in a bucket.
const lifecycleConfig = {
    Rules: [
        {
            ID: "DeleteOldFiles", // Unique identifier for the rule.
            Status: "Enabled", // Rule status. Value:- Enabled or Disabled
            Filter: { // Object filter criteria.
                Prefix: "logs/", // Apply rule to objects with this prefix.
                Tag: { Key: "env", Value: "production" } // Apply rule to objects with this tag.
            },
            Expiration: { Days: 30, Date: "2027-01-01T00:00:00Z" }, // Expire objects after 30 days.
            NoncurrentVersionExpiration: { NoncurrentDays: 60 }, // Expire non-current versions after 60 days (requires versioning).
            AbortIncompleteMultipartUpload: { DaysAfterInitiation: 7 } // Abort multipart uploads that are not completed within 7 days.
        }
    ]
}
await client.getBucketLifecycle(bucketName); // Returns bucket lifecycle configuration. Return Value:- Promise<LifecycleConfiguration>
await client.removeBucketLifecycle(bucketName); // Removes bucket lifecycle configuration. Return Value:- undefined
await client.setBucketReplication(bucketName, replicationConfig); // Configures bucket replication. Return Value:- undefined
const replicationConfig = {
    Role: "arn:aws:iam::123456789012:role/replication-role", // IAM role ARN for replication.
    Rules: [
        {
            ID: "ReplicateAll", // Unique identifier for the rule.
            Status: "Enabled", // Rule status. Value:- Enabled or Disabled
            priority: 1, // Rule priority (lower number means higher priority).
            DeleteMarkerReplication: "Enabled", // Replicate delete markers (requires versioning).
            Filter: { // Object filter criteria.
                Prefix: "data/", // Apply rule to objects with this prefix.
                Tag: { Key: "env", Value: "production" } // Apply rule to objects with this tag.
            },
            Destination: { Bucket: "arn:aws:s3:::destination-bucket" } // Destination bucket ARN for replication.
        }
    ]
}
await client.getBucketReplication(bucketName); // Returns bucket replication configuration. Return Value:- Promise<ReplicationConfiguration>
await client.removeBucketReplication(bucketName); // Removes bucket replication configuration. Return Value:- undefined

// Object Operations
await client.putObject(bucketName, objectName, data, size, metadata); // Uploads an object from a buffer, stream. Return Value:- Promise<string> (ETag) Return value:- Promise<{ etag: string }>
// Metadata Keys
{
    "Content-Type": "image/jpeg" // Content-Type
    "Content-Encoding": "gzip" // Content-Encoding
    "Cache-Control": "max-age=3600" // Cache-Control  
    "Content-Disposition": "attachment; filename=file.pdf" // Content-Disposition
    "Content-Language": "en" //Content-Language
    Expires: new Date(Date.now() + 86400000) // Expires
    "x-amz-meta-user": "chandan", //Custom Metadata
        "x-amz-meta-role": "admin",
            "x-amz-meta-project": "erp"
}
await client.fPutObject(bucketName, objectName, filePath, metadata); // Uploads an object from a local file. Return Value:- Promise<string> (ETag)
await client.getObject(bucketName, objectName, getOpts); // Download object as stream. Return Value:- Promise<ReadableStream> getOpts:- options
await client.fGetObject(bucketName, objectName, filePath, getOpts); // Downloads an object to a local file. Return Value:- Promise<void> getOpts:- options
await client.statObject(bucketName, objectName, statOpts); // Returns object metadata. Return Value:- Promise<{ size: number, etag: string, contentType: string, lastModified: Date, metadata: { [key: string]: string } }> statOpts:- options
statOpts: - {
    versionId: "string", // Version ID of the object (if versioning is enabled).
    matchETag: "string", // Only return metadata if the ETag matches this value.
    notMatchETag: "string", // Only return metadata if the ETag does not match this value.
    modifiedSince: new Date(), // Only return metadata if the object was modified since this date.
    unmodifiedSince: new Date(), // Only return metadata if the object was unmodified since this date.
}
await client.removeObject(bucketName, objectName); // Deletes an object. Return Value:- Promise<void>
await client.removeObjects(bucketName, [objectName1, objectName2]); // Deletes multiple objects. Return Value:- Promise<Array<{ name: string, error: Error }>>
await client.presignedGetObject(bucketName, objectName, expires, reqOpts); // Generates a presigned URL for downloading an object. Return Value:- Promise<string> (URL) reqOpts:- options
reqOpts: - {
    versionId: "string", // Version ID of the object (if versioning is enabled).
    responseContentType: "string", //image/png // Override Content-Type in the response.
    responseContentDisposition: "string", // Override Content-Disposition in the response.
    responseCacheControl: "string", // Override Cache-Control in the response.
    responseContentEncoding: "string", // Override Content-Encoding in the response.
    responseContentLanguage: "string", // Override Content-Language in the response.
}
await client.presignedUrl(method, bucketName, objectName, expires, reqOpts); // Generates a presigned URL for any HTTP method. Return Value:- Promise<string> (URL) method:- HTTP method (e.g., "GET", "PUT", "DELETE") reqOpts:- options
await client.listBuckets(bucketName, prefix, recursive); // Lists objects in a bucket. Return Value:- Promise<Array<{ name: string, prefix: string, size: number, etag: string, contentType: string, lastModified: Date }>> recursive:- boolean
// ex:- await client.listBuckets(bucketName, image/, true);
await client.listObjectsV2(bucketName, prefix, recursive, startAfter); // Lists objects in a bucket using the V2 API. Return Value:- Promise<Array<{ name: string, prefix: string, size: number, etag: string, contentType: string, lastModified: Date }>> recursive:- boolean
// ex:- await client.listObjectsV2(bucketName, image/, true. "images/a.jpg");
await client.composeObject(bucketName, objectName, sourceObjects, metadata); // Composes a new object from existing objects. Return Value:- Promise<string> (ETag)
await client.copyObject(bucketName, objectName, source, metadata); // Copies an object. Return Value:- Promise<string> (ETag)
await client.copyObjectWithConditions(bucketName, objectName, source, conditions, metadata);
// Copies an object with conditions. Return Value:- Promise<string> (ETag)
conditions: - {
    matchETag: "string", // Only copy if the ETag matches this value.
    notMatchETag: "string", // Only copy if the ETag does not match this value.
    modifiedSince: new Date(), // Only copy if the object was modified since this date.
    unmodifiedSince: new Date(), // Only copy if the object was unmodified since this date.
}