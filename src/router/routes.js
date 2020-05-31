import { Loading } from "quasar"
Loading
import Camera from "pages/Camera.vue"

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { name: "index", path: "", component: () => import("pages/Index.vue") },
      { name: "sudoku", path: "sudoku/:sudoku", component: () => import("pages/Index.vue") },
    ],
  },
  { name: "camera", path: "/camera", component: Camera },
]

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue"),
  })
}

export default routes
