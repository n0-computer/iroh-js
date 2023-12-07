// import { expect, test } from "bun:test";
// import http from 'http';
// import { Rpc, defaultRpcOptions } from "../src/rpc";

// test("rpc roundtrip test", async () => {
//   // Create an HTTP server
//   const server = http.createServer((req, res) => {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello, world!');
//   });

//   // Start the server on a random port
//   await new Promise((resolve, reject) => {
//     server.listen(0, resolve);
//   });

//   // Get the address of the server
//   const address = server.address();

//   const rpc = Rpc({ type: 'http', baseUrl: `http://localhost:${address.port}` });
//   rpc.call('/hello', undefined).then((result) => {
//     expect(result).toBe('Hello, world!');
//   });

//   // Close the server
//   server.close();
// });