import { FailureData } from "../../../salt/types";
interface InfoData {
    type: "info";
    reason: string;
}
export declare const InfoCard: (props: {
    data: InfoData | FailureData;
}) => import("react/jsx-runtime").JSX.Element;
export {};
