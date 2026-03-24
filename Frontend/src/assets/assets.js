import logo from "./logo/devbot.png";
import {BadgeDollarSign, Coins, FunnelPlus, LayoutDashboard, List, Target, Wallet} from "lucide-react";

export const assets = {
    logo,
}

export const SIDE_BAR_DATA = [
    {
        id: "01",
        label: "Tổng quan",
        icon: LayoutDashboard,
        path: "/dashboard",
    },
    {
        id: "02",
        label: "Danh mục",
        icon: List,
        path: "/category",
    },
    {
        id: "03",
        label: "Thu nhập",
        icon: Wallet,
        path: "/income",
    },
    {
        id: "04",
        label: "Chi tiêu",
        icon: Coins,
        path: "/expense",
    },
    {
        id: "05",
        label: "Bộ lọc",
        icon: FunnelPlus,
        path: "/filter",
    },
    {
        id: "06",
        label: "Ngân sách",
        icon: Target,
        path: "/budget",
    },
    {
        id: "07",
        label: "Thanh toán",
        icon: BadgeDollarSign,
        path: "/payment",
    },
];
