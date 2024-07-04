import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';


import { Product, Variant } from '../../ProductCard';
import { ProductListService } from '../../product-list.service';
import { WishlistProductsComponent } from '../wishlist-products/wishlist-products.component';

@Component({
  selector: 'app-product-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-cards.component.html',
  styleUrls: ['./product-cards.component.css']
})
export class ProductCardsComponent implements OnInit {
  sku: string | undefined;
  id: string | undefined;
  product: Product[] | undefined;
  selectedVariant = 0;

  constructor(
    private productListService: ProductListService,
    public wishlistProductsComponent: WishlistProductsComponent,
    private cdr: ChangeDetectorRef
  ) {
    this.productListService.getWishlistUpdates().subscribe((wishlist) => {
      this.wishlistProductsComponent.wishlistProducts$ = of(wishlist.map(item => ({
        ...item,
        variants: item.variants || [] as Variant[],
        variant: item.variants ? item.variants[0] : {} as Variant,
        variantWishlist: item.wishlist
      })));
      this.updateWishlistStatus();
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.productListService.getProducts().toPromise();
      this.product = data;
      this.cdr.detectChanges();
      await this.updateWishlistStatus();
      console.log(this.product, 'product');
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  selectVariant(event: Event): void {
    const target = event.target as HTMLElement;
    const dataIndex = target.getAttribute('data-index');
    const siblings = target.parentElement?.children;
    if (siblings) {
      Array.from(siblings).forEach((sibling: Element) => {
        sibling.classList.remove('selected');
      });
    }
    target.classList.add('selected');
    const newImage = target.getAttribute('data-image');
    const newPrice = target.getAttribute('data-originalprice');
    const newReducedPrice = target.getAttribute('data-saleprice');
    const productId = target.getAttribute('data-id');
    const productCards = document.querySelectorAll('.product-card');
    const newSKU = target.getAttribute('data-sku');

    productCards.forEach((productCard: Element) => {
      if (productCard.getAttribute('data-id') === productId) {
        const productImage = productCard.querySelector('.product-image');
        if (productImage && newImage) {
          productImage.setAttribute('src', newImage);
        }
        const discountTag = productCard.querySelector('.discount-tag');
        if (discountTag && newReducedPrice && newPrice) {
          discountTag.classList.remove('hidden');
          if (parseFloat(newPrice) > parseFloat(newReducedPrice)) {
            const discountPercentage = ((parseFloat(newPrice) - parseFloat(newReducedPrice)) / parseFloat(newPrice)) * 100;
            discountTag.textContent = `-${discountPercentage.toFixed(0)}%`;
            const originalPrice = productCard.querySelector('.original-price');
            originalPrice?.classList.add('line-through');
            const salePrice = productCard.querySelector('.sale-price');
            if (salePrice) {
              salePrice.classList.remove('hidden');
              salePrice.textContent = `€${newReducedPrice}`;
            }
          } else {
            discountTag.classList.add('hidden');
            const originalPrice = productCard.querySelector('.original-price');
            originalPrice?.classList.remove('line-through');
            const salePrice = productCard.querySelector('.sale-price');
            salePrice?.classList.add('hidden');
            if (salePrice) {
              salePrice.textContent = `€${newPrice}`;
            }
          }
        } else {
          discountTag?.classList.add('hidden');
          const originalPrice = productCard.querySelector('.original-price');
          originalPrice?.classList.remove('line-through');
          const salePrice = productCard.querySelector('.sale-price');
          salePrice?.classList.add('hidden');
          if (salePrice) {
            salePrice.textContent = `€${newPrice}`;
          }
        }

        const addToWishlistButton = productCard.querySelector('.add-to-wishlist-button');
        const skuInput = productCard.querySelector('.sku-input');
        if (addToWishlistButton && newSKU) {
          addToWishlistButton.setAttribute('data-sku', newSKU);
          skuInput?.setAttribute('value', newSKU);
        }
      }
    });
  }

  async updateWishlistStatus(): Promise<void> {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((productCard) => {
      const sku = productCard.querySelector('.add-to-wishlist-button')?.getAttribute('data-sku');
      console.log(sku, 'sku');
      if (sku) {
        console.log(this.wishlistProductsComponent.wishlistProducts$, 'wishlistProducts');
        this.wishlistProductsComponent.wishlistProducts$.subscribe(products => {
          const isInWishlist = products.some((product: { variants: { sku: string; wishlist: boolean }[] }) =>
            product.variants.some((variant: { sku: string; wishlist: boolean }) => variant.sku === sku && variant.wishlist)
          );
          const wishlistForm = productCard.querySelector('.add-to-wishlist-form');
          if (isInWishlist) {
            wishlistForm?.classList.add('wishlist-added');
          } else {
            wishlistForm?.classList.remove('wishlist-added');
          }
        });
      }
    });
  }
}
