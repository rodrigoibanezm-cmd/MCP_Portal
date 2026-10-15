import http from "node:http";
import { URL } from "node:url";
import mcp from "./api/mcp.js";
import oauthLogin from "./api/oauth/login.js";
import oauthCallback from "./api/oauth/callback.js";

const routes = {"/api/mcp":mcp,"/api/oauth/login":oauthLogin,"/api/oauth/callback":oauthCallback};
http.createServer(async (request,response)=>{
  const path=new URL(request.url,"http://localhost").pathname;
  if(path==="/api/mcp" && (!process.env.MCP_API_TOKEN || request.headers.authorization!==`Bearer ${process.env.MCP_API_TOKEN}`)) {response.writeHead(401);response.end("Unauthorized");return;}
  const handler=routes[path];
  if(!handler){response.writeHead(404);response.end("Not found");return;}
  let body;
  if(request.method==="POST"){
    try {const chunks=[];for await(const chunk of request)chunks.push(chunk);
      if(Buffer.concat(chunks).length>1_048_576)throw Error("Payload too large");
      body=JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }catch {response.writeHead(400);response.end("Invalid JSON");return;}
  }
  const req=Object.assign(request,{body,query:Object.fromEntries(new URL(request.url,"http://localhost").searchParams)});
  const res=Object.assign(response,{
    status(code){response.statusCode=code;return this;},
    json(data){response.setHeader("Content-Type","application/json");response.end(JSON.stringify(data));return this;},
    redirect(code,location){response.writeHead(code,{Location:location});response.end();return this;}
  });
  try{await handler(req,res);}catch(e){if(!response.writableEnded){response.statusCode=500;response.end("Server error");}}
}).listen(Number(process.env.PORT||8080),"0.0.0.0");
