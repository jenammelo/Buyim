import { serve } from "inngest/next";

let inngest, functions;
let importError = null;

try {
  const clientModule = require("@/inngest/client");
  const funcsModule = require("@/inngest/functions");
  inngest = clientModule.inngest;
  functions = Object.values(funcsModule);
} catch (err) {
  importError = err?.stack || err?.message || String(err);
}

export async function GET(request) {
  if (importError) {
    return new Response(
      JSON.stringify({
        status: "IMPORT_ERROR",
        error: importError,
        envCheck: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasDirectUrl: !!process.env.DIRECT_URL,
          hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
        }
      }, null, 2),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const handler = serve({
    client: inngest,
    functions: functions,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  });

  return handler.GET(request);
}

export async function POST(request) {
  if (importError) {
    return new Response(JSON.stringify({ error: importError }), { status: 500 });
  }
  const handler = serve({
    client: inngest,
    functions: functions,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  });
  return handler.POST(request);
}