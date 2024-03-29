import Link from "next/link";
import TwoFactorAuthentication from "~/components/Forms/Login/TwoFactorAuthentication";
import Logo from "~/components/Logo";
import { useAuthContext } from "~/contexts/AuthContext";

const authentication = () => {
  const { user } = useAuthContext();

  if (user) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand">
      <div className="container flex flex-col items-center justify-center px-[20px] py-16 md:px-14">
        <Logo />

        <TwoFactorAuthentication />

        <Footer />
      </div>
    </main>
  );
};

const Footer = () => {
  return (
    <Link
      href="/recover"
      className="label-lg relative px-[12px] py-[10px] text-primary-200 hover:underline"
    >
      Enter Backup Code
    </Link>
  );
};

export default authentication;
