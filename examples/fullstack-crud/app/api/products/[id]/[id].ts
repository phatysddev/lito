import { defineApiRoute } from "@litoho/server";

type Products[id]DetailParams = {
  id: string;
};

const route = defineApiRoute<Products[id]DetailParams>({
  get: ({ params }) =>
    Response.json({
      ok: true,
      resource: "products/[id]",
      action: "detail",
      id: params.id
    }),
  put: ({ params }) =>
    Response.json({
      ok: true,
      resource: "products/[id]",
      action: "update",
      id: params.id
    }),
  delete: ({ params }) =>
    Response.json({
      ok: true,
      resource: "products/[id]",
      action: "delete",
      id: params.id
    })
});

export default route;
