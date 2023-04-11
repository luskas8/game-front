import { createBrowserRouter, RouterProvider } from "react-router-dom";

interface Route {
    path: string;
    Element: React.FC;
    loader?: () => Promise<any>
    action?: () => Promise<any>
    ErrorBoundary?: React.FC
}

interface Pages {
    [key: string]: {
        default: React.FC
        loader?: () => Promise<any>
        action?: () => Promise<any>
        ErrorBoundary?: React.FC
    }
}

const pages: Pages = import.meta.glob("./pages/**/*.tsx", { eager: true });

const routes: Route[] = [];
for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.tsx$/)?.[1];
  if (!fileName) {
    continue;
  }

  const normalizedPathName = fileName.includes("$")
    ? fileName.replace("$", ":")
    : fileName.replace(/\/index/, "");

  routes.push({
    path: fileName === "index" ? "/" : `/${normalizedPathName.toLowerCase()}`,
    Element: pages[path].default,
    loader: pages[path]?.loader,
    action: pages[path]?.action,
    ErrorBoundary: pages[path]?.ErrorBoundary,
  });
}

const router = createBrowserRouter(
  routes.map(({ Element, ErrorBoundary, ...rest }) => ({
    ...rest,
    element: <Element />,
    ...(ErrorBoundary && { errorElement: <ErrorBoundary /> }),
  }))
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;