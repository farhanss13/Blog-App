import {Link, Outlet } from "react-router-dom";

function NavBar() {
  return (
    <>
      <div className="bg-gray-600 h-12 text-white flex items-center px-4">
        <Link to ="/">Blog App</Link>
      </div>

      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
}

export default NavBar;
