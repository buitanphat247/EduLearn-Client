import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ZaloButton from "../components/common/ZaloButton";



export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ZaloButton />
    </>
  );
}
