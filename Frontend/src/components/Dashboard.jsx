import Menubar from "./Menubar.jsx";
import Sidebar from "./Sidebar.jsx";
import {useContext} from "react";
import {AppContext} from "../context/AppContext.jsx";

const Dashboard = ({children, activeMenu}) => {
    const {user} = useContext(AppContext);
    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#191c1e] antialiased">
            {user && <Sidebar activeMenu={activeMenu}/>}
            <Menubar activeMenu={activeMenu} />

            {user && (
                <main className="ml-0 lg:ml-64 pt-20 p-8 space-y-8 min-h-screen bg-[#F8F9FA]">
                    {children}
                </main>
            )}
        </div>
    )
}

export default Dashboard;
