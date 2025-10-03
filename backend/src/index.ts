import { Elysia, } from "elysia";
import { auth } from "./lib/auth";
import { cors } from "@elysiajs/cors";
import { ElysiaLogging } from "@otherguy/elysia-logging";

const posts = [
  {
    id: 1,
    title: "First Post",
    content: "This is the content of the first post.",
  },
  {
    id: 2,
    title: "Second Post",
    content: "This is the content of the second post.",
  }
]

const assetLink = [
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.timothymugo.rendercondemo2025",
      "sha256_cert_fingerprints": [
        "FB:E7:D2:4E:BC:35:F4:C2:EF:C8:9D:66:C8:22:63:9D:CE:E4:6D:C9:5F:FD:BF:DD:07:8A:DA:3B:1D:A8:9D:45"
      ]
    }
  }
]


const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

const app = new Elysia()
.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(betterAuth)
  .onBeforeHandle(({ request }) => {
      console.log(`Incoming request: ${request.method} ${request.url}`);
      // You can log more details from the request object here
    })
    .onAfterHandle(({ request, response }) => {
      console.log(`Outgoing response for ${request.method} ${request.url}: Status ${response.status}`);
      // You can log response details here
    })
.get("/", () => "Hello Elysia")
.get('/posts', ({ user, session }) => posts, {
  auth: true
})
.get('.well-known/assetlinks.json' ,() => assetLink)
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
