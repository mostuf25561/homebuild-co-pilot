import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "task managment system" },
      { name: "description", content: "task managment framework" },
      { property: "og:title", content: "task managment system" },
      { name: "twitter:title", content: "task managment system" },
      { property: "og:description", content: "task managment framework" },
      { name: "twitter:description", content: "task managment framework" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aa0d143e-ce9d-4fc7-92e8-213a3ad228d8/id-preview-3e90efe8--2d15fdd5-fd4c-46d1-82b9-75e0d0f957dc.lovable.app-1782761562220.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/aa0d143e-ce9d-4fc7-92e8-213a3ad228d8/id-preview-3e90efe8--2d15fdd5-fd4c-46d1-82b9-75e0d0f957dc.lovable.app-1782761562220.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div dir="rtl" className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2">העמוד לא נמצא</p>
        <a href="/" className="text-primary underline mt-4 inline-block">חזרה לדף הבית</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
