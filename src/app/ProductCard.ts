// Define the interface for the variant of a product
export interface Variant {
    label: string;
    color: string;
    sku: string;
    price: number;
    reducedPrice?: number;
    thumbnail: string;
    image: string;
    wishlist: boolean;
}

// Define the interface for the product
export interface Product {
    id: string;
    title: string;
    description: string;
    vendor: string;
    tags?: string[];
    variants: Variant[];
    wishlist: boolean;
}
