import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthGuard } from '../components/common/AuthGuard';
import { LoginPage } from '../pages/LoginPage';
import { LandingPlansPage } from '../pages/LandingPlansPage';
import { PublicMenuPage } from '../pages/PublicMenuPage';
import { TraditionalMenuPage } from '../pages/TraditionalMenuPage';
import { PromotionalWebsitePage } from '../pages/PromotionalWebsitePage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { TablesPage } from '../pages/TablesPage';
import { OrdersPage } from '../pages/OrdersPage';
import { CajaPage } from '../pages/CajaPage';
import { DeliveryPage } from '../pages/DeliveryPage';
import { IngredientsPage } from '../pages/IngredientsPage';
import { RecipeCostsPage } from '../pages/RecipeCostsPage';
import { MetricsPage } from '../pages/MetricsPage';
import { RotationPage } from '../pages/RotationPage';
import { DigitalMenuAdminPage } from '../pages/DigitalMenuAdminPage';
import { InsightsPage } from '../pages/InsightsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { RewardsPage } from '../pages/RewardsPage';
import { VirtualCardsPage } from '../pages/VirtualCardsPage';
import { WhatsAppPage } from '../pages/WhatsAppPage';
import { AutomationsPage } from '../pages/AutomationsPage';
import { ManualsPage } from '../pages/ManualsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { WebsiteEditorPage } from '../pages/WebsiteEditorPage';

export const router = createBrowserRouter([
  // ============================================================
  // PUBLIC ROUTES (no auth required)
  // ============================================================
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/planes',
    element: <LandingPlansPage />,
  },
  {
    path: '/menu',
    element: <PublicMenuPage />,
  },
  {
    path: '/carta-tradicional',
    element: <TraditionalMenuPage />,
  },
  {
    path: '/sitio-promocional',
    element: <PromotionalWebsitePage />,
  },

  // ============================================================
  // PROTECTED ROUTES (auth required via AuthGuard)
  // ============================================================
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'productos',
            element: <ProductsPage />,
          },
          {
            path: 'categorias',
            element: <CategoriesPage />,
          },
          {
            path: 'mesas',
            element: <TablesPage />,
          },
          {
            path: 'pedidos',
            element: <OrdersPage />,
          },
          {
            path: 'caja',
            element: <CajaPage />,
          },
          {
            path: 'delivery',
            element: <DeliveryPage />,
          },
          {
            path: 'ingredientes',
            element: <IngredientsPage />,
          },
          {
            path: 'recetas',
            element: <RecipeCostsPage />,
          },
          {
            path: 'customers',
            element: <CustomersPage />,
          },
          {
            path: 'menu-admin',
            element: <DigitalMenuAdminPage />,
          },

          {
            path: 'rotation',
            element: <RotationPage />,
          },
          {
            path: 'rotacion',
            element: <RotationPage />,
          },
          {
            path: 'insights',
            element: <InsightsPage />,
          },
          {
            path: 'clientes',
            element: <CustomersPage />,
          },
          {
            path: 'puntos',
            element: <RewardsPage />,
          },
          {
            path: 'tarjetas',
            element: <VirtualCardsPage />,
          },
          {
            path: 'whatsapp',
            element: <WhatsAppPage />,
          },
          {
            path: 'automatizaciones',
            element: <AutomationsPage />,
          },
          {
            path: 'manuales',
            element: <ManualsPage />,
          },
          {
            path: 'editor-web',
            element: <WebsiteEditorPage />,
          },
          {
            path: 'configuracion',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },

  // Catch-all: redirect to login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
