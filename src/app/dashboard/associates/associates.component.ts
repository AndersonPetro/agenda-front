import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-associates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './associates.component.html',
  styles: [`
    .associates-container {
      padding: 1rem 0;
    }
    .page-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-header h2 {
      font-size: 1.8rem;
    }
    .subtitle {
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
    }
    .empty-state .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AssociatesComponent implements OnInit {

  associates: any[] = [];
  isLoading = false;

  constructor() { }

  ngOnInit(): void {
    // Inicializar carregamento de associados
  }

}
