
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductCardsComponent } from './MyComponents/product-cards/product-cards.component';
import { WishlistProductsComponent } from './MyComponents/wishlist-products/wishlist-products.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ProductCardsComponent, WishlistProductsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'wishlist-app';
}
