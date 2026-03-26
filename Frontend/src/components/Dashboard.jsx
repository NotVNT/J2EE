import Menubar from "./Menubar.jsx";
import Sidebar from "./Sidebar.jsx";
import {useContext, useMemo} from "react";
import {AppContext} from "../context/AppContext.jsx";

const Dashboard = ({children, activeMenu}) => {
    const {user} = useContext(AppContext);

    const isVip = useMemo(() => {
        return user?.subscriptionPlan === "PREMIUM" && user?.subscriptionStatus === "ACTIVE";
    }, [user?.subscriptionPlan, user?.subscriptionStatus]);

    return (
        <div className={isVip ? "vip" : ""}>
            <Menubar activeMenu={activeMenu} isVip={isVip} />

            {user && (
                <div className="flex">
                    <div className="max-[1080px]:hidden">
                        <Sidebar activeMenu={activeMenu} isVip={isVip} />
                    </div>

                    <div className="grow mx-5">{children}</div>
                </div>
            )}
        </div>
    )
}

export default Dashboard;
