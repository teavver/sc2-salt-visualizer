interface PropertyProps {
    id: string;
    name: string;
    value: string;
    bracket?: "left" | "right";
}
export declare const propertyIdMap: Map<number, string>;
export declare const propertyColorMap: Map<string, string>;
export declare const Property: ({ id, name, value, bracket }: PropertyProps) => import("react/jsx-runtime").JSX.Element;
export {};
