import { defineApiRoute } from "@litoho/server";

type ProductsDetailParams = {
  id: string;
};

const route = defineApiRoute<ProductsDetailParams>({
  get: ({ params }) =>
    Response.json({
      ok: true,
      resource: "products",
      action: "detail",
      id: params.id
    }),
  put: ({ params }) =>
    Response.json({
      ok: true,
      resource: "products",
      action: "update",
      id: params.id
    }),
  delete: ({ params }) =>
    Response.json({
      ok: true,
      resource: "products",
      action: "delete",
      id: params.id
    })
});

export default route;
