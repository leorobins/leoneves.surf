import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductPage from "@/pages/product";
import Cart from "@/pages/cart";
import BrandPage from "@/pages/brand";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/cart" component={Cart} />
      <Route path="/brand/:id" component={BrandPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="amazonclone-theme">
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;