# iroh-js

This is a very much work-in-progress version of a javascript client for iroh. It's distinct from [iroh-ffi](https://github.com/n0-computer/iroh-ffi), which actually embeds an iroh node in the host language. This package focuses on defining the core iroh API in javascript & backing it with some sort of RPC API.

Currently the only supported RPC backing is iroh.network (documentation [here](https://iroh.computer/docs/reference/http-api)). Get an API token then boot up with:

```ts
import { Node } from '@n0computer/iroh'

const auth = process.env['IROH_AUTH_TOKEN']
const node = new Node({
  type: 'http',
  baseUrl: 'https://api.iroh.network',
  username: 'your_username',
  auth,
});
```