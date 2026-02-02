import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const dynamic = "force-dynamic";

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
