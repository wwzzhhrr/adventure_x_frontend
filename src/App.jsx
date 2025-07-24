import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../src/components/Login";


const router = createBrowserRouter([
  {
    path: "login",
    element:
      <div className={"login-container"}>
        <Login/>
      </div>
  },
  {
    path: "homepage",
    element: <div>homepage</div>
  }
]);

function App() {
  return <RouterProvider router={router} />;
}


export default App