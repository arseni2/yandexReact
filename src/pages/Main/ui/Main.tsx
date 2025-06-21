import Header from "../../../widgets/Header/ui/Header.tsx";
import {Outlet} from "react-router";

const Main = () => {
    return (
        <>
            <Header />
            <Outlet />
        </>
    );
};

export default Main;