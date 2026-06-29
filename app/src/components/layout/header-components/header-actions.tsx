"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { IconButton } from "@/components/ui/icon-button";
import { Select, type SelectOption } from "@/components/ui";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "next-intl";
import { User, Package, LogOut, Wallet, Heart, MapPin, UserCog } from "lucide-react";

import { useWallet } from "@/hooks/useWallet";
import {
  resolveFeatureToggles,
  useFeatureToggles,
} from "@/hooks/useFeatureToggles";
import { formatPrice } from "@/lib/utils";
import { CURRENCY_CONFIG } from "@/lib/constants";
import { useLocale } from "next-intl";
import { SellWithUsCta } from "./sell-with-us-cta";

export function HeaderActions() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { totalItems, toggleCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { openAuthModal } = useAuthModal();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, isLoggingOut } = useAuth();
  const { data: featureToggles } = useFeatureToggles();
  const { cashbackEnabled } = resolveFeatureToggles(featureToggles);
  const { data: wallet } = useWallet({
    enabled: isAuthenticated && cashbackEnabled,
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const profileOptions: SelectOption[] = [
    { value: "/profile", label: t("myProfile"), icon: User },
    ...(cashbackEnabled
      ? [{ value: "/profile/wallet", label: t("myWallet"), icon: Wallet } satisfies SelectOption]
      : []),
    { value: "/profile/wishlist", label: t("myWishlist"), icon: Heart },
    { value: "/profile/addresses", label: t("addresses"), icon: MapPin },
    { value: "/orders", label: t("myOrders"), icon: Package },
    { value: "/profile/account", label: t("accountDetails"), icon: UserCog },
    { type: 'divider', value: 'divider', label: 'divider' },
    { value: "logout", label: t("logout"), icon: LogOut }
  ];

  const handleProfileChange = (value: string) => {
    if (value === "logout") {
      handleLogout();
    } else {
      router.push(value);
    }
  };

  return (
    <div className="flex items-center gap-2 lg:gap-3">

      {/* Language Switcher - Desktop Only */}
      <div className="hidden lg:block ">
        <LanguageSwitcher />
      </div>
      <div className="w-px h-8 bg-white/10 hidden lg:block"></div>

      <SellWithUsCta />

      <SellWithUsCta variant="headerMobile" className="lg:hidden" />

      {cashbackEnabled && isAuthenticated && wallet && (
        <>
          <div className="w-px h-8 bg-white/10 hidden lg:block"></div>
          <Link href="/profile/wallet" className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 hover:bg-secondary/20 transition-all border border-white/10">
            <Wallet className="w-4 h-4 text-secondary" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-white/70 uppercase font-medium">{t('myWallet')}</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {formatPrice(Number(wallet.balance) || 0, wallet.currency || CURRENCY_CONFIG.code, locale as any)}
              </span>
            </div>
          </Link>
          <Link
            href="/profile/wallet"
            className="lg:hidden inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-secondary/10 px-2.5 py-1 text-white transition-all hover:bg-secondary/20"
          >
            <Wallet className="w-3.5 h-3.5 text-secondary" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] text-white/70 uppercase font-medium">{t('myWallet')}</span>
              <span className="text-xs font-bold text-white tabular-nums whitespace-nowrap">
                {formatPrice(Number(wallet.balance) || 0, wallet.currency || CURRENCY_CONFIG.code, locale as any)}
              </span>
            </div>
          </Link>
        </>
      )}

      <div className="w-px h-8 bg-white/10 hidden lg:block"></div>

      {/* Wishlist - Always visible on mobile to replace language */}
      <Link
        prefetch={isAuthenticated}
        href="/profile/wishlist"
        className="hidden md:flex"
        data-prevent-loader={!isAuthenticated ? "true" : undefined}
        onClick={(e) => {
          if (isAuthLoading) {
            e.preventDefault();
            return;
          }
          if (!isAuthenticated) {
            e.preventDefault();
            openAuthModal("login", { returnTo: "/profile/wishlist" });
          }
        }}
      >
        <IconButton
          variant="header"
          badge={wishlistItems.length}
          aria-label="Wishlist"
          icon="heart"
        />
      </Link>

      <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

      {/* User Account */}
      <div className="relative hidden sm:block">
        {isAuthLoading ? (
          <div className="flex items-center gap-1 opacity-70">
            <IconButton
              variant="header"
              aria-label="Account"
              icon="user"
            />
          </div>
        ) : isAuthenticated ? (
          <Select
            options={profileOptions}
            value=""
            onChange={handleProfileChange}
            placeholder={isLoggingOut ? t("logout") : `${t("hi")}${user?.firstName ? ` ${user.firstName}` : ""}`}
            className="w-auto min-w-[140px]"
            variant="header"
          />
        ) : (
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => openAuthModal()}
          >
            <span
              className="text-white text-sm font-medium hidden lg:block px-1"
            >
              {t("login")}
            </span>

            <IconButton
              variant="header"
              aria-label="Login"
              icon="user"
            />
          </div>
        )}
      </div>

      <div className="w-px h-8 bg-white/10 hidden lg:block"></div>

      {/* Cart */}
      <div className="hidden sm:flex">
        <IconButton
          variant="header"
          badge={totalItems}
          aria-label="Cart"
          icon="cart"
          onClick={toggleCart}
        />
      </div>

    </div>
  );
}
