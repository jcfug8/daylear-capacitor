import { userFirstInitial } from "../lib/user-display";

type MenuAvatarButtonProps = {
  name: string;
};

function openAppMenu() {
  const menu = document.querySelector('ion-menu[content-id="main-content"]');
  if (menu && "open" in menu) {
    void (menu as HTMLIonMenuElement).open();
  }
}

export function MenuAvatarButton({ name }: MenuAvatarButtonProps) {
  const initial = userFirstInitial(name);

  return (
    <button
      type="button"
      aria-label="Open menu"
      className="m-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--ion-color-light-shade)] bg-white text-base font-semibold text-[#2f5c4a] shadow-sm cursor-pointer active:opacity-80"
      onClick={openAppMenu}
    >
      {initial}
    </button>
  );
}
