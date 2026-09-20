import { ItemType } from '../models/Item';

export interface DiscountInputItem {
    type: ItemType;
    price: number;
}

export interface DiscountResult {
    servicesCount: number;
    productsCount: number;
    servicesSubtotal: number;
    productsSubtotal: number;
    servicesDiscountPercentage: number;
    productsDiscountPercentage: number;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
}

const roundMoney = (value: number): number =>
    Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Reglas de negocio Disagro:
 * Servicios: >=2 → 3%; >=2 y suma > Q.1500 → 5%
 * Productos: >=3 → 3%; >=5 → 5%
 */
export const calcularDescuentos = (items: DiscountInputItem[]): DiscountResult => {
    const services = items.filter((item) => item.type === 'SERVICE');
    const products = items.filter((item) => item.type === 'PRODUCT');

    const servicesSubtotal = roundMoney(
        services.reduce((sum, item) => sum + Number(item.price), 0)
    );
    const productsSubtotal = roundMoney(
        products.reduce((sum, item) => sum + Number(item.price), 0)
    );

    let servicesDiscountPercentage = 0;
    if (services.length >= 2 && servicesSubtotal > 1500) {
        servicesDiscountPercentage = 5;
    } else if (services.length >= 2) {
        servicesDiscountPercentage = 3;
    }

    let productsDiscountPercentage = 0;
    if (products.length >= 5) {
        productsDiscountPercentage = 5;
    } else if (products.length >= 3) {
        productsDiscountPercentage = 3;
    }

    const servicesFinal = roundMoney(
        servicesSubtotal * (1 - servicesDiscountPercentage / 100)
    );
    const productsFinal = roundMoney(
        productsSubtotal * (1 - productsDiscountPercentage / 100)
    );

    const totalAmount = roundMoney(servicesSubtotal + productsSubtotal);
    const finalAmount = roundMoney(servicesFinal + productsFinal);
    const discountAmount = roundMoney(totalAmount - finalAmount);

    return {
        servicesCount: services.length,
        productsCount: products.length,
        servicesSubtotal,
        productsSubtotal,
        servicesDiscountPercentage,
        productsDiscountPercentage,
        totalAmount,
        discountAmount,
        finalAmount
    };
};
