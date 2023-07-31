interface ICoinInfo {
    id: number | string | undefined;
    name: string | undefined;
    logo: string | undefined;
    description: string | undefined;
    price: string | number | undefined;
    priceChange: string | number | undefined;
    urls: Array<{ type: string, values: string }>;
    chart: Array<any>;
}