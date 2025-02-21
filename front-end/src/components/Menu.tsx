import Link from "next/link";
import Image from "next/image";

const menuItems = [
  { name: "Top", path: "/", img: "/home_icon.svg" },
  { name: "お気に入り", path: "/favorite", img: "/favorite_icon.svg" },
  { name: "設定", path: "/setting", img: "/settings_icon.svg" },
 // { name: "アレルギー除外", path: "/allergy", img: "/allergy_icon.svg" },
  //設定　ー＞　アレルギー除外　とかに名前変えてもいいかも
  //{ name: "ログアウト", path: "/logout", img: "/logout_icon.svg" },
];

const Menu = ({ isOpen, closeMenu }: { isOpen: boolean; closeMenu: () => void }) => {
  return (
    <div>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      ></div>
      <nav
        className={`fixed top-0 right-0 h-full bg-white text-black shadow-lg p-4 w-56 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="p-2 hover:bg-gray-200 rounded">
              <Link href={item.path} className="pt-3 flex items-center gap-2">
                <Image src={item.img || "/default_icon.svg"} alt={item.name} width={20} height={20} />
                <span>{item.name}</span>
              </Link>   
            </li>
          ))}
        </ul> 
      </nav>
    </div>
  );
};


export default Menu;