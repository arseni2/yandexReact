import {createRoot} from 'react-dom/client'
import "./app/styles/index.css"
import {RouterProvider} from "react-router";
import {router} from "./app/config/router.ts";

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
