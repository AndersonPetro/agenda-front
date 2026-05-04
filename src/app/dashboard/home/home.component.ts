import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styles: [`
    .dashboard-home {
      padding: 1rem 0;
    }
    .page-header {
      margin-bottom: 2rem;
    }
    .page-header h2 {
      font-size: 1.8rem;
    }
    .subtitle {
      color: var(--text-secondary);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      gap: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent-primary);
    }
    .stat-icon {
      font-size: 2.5rem;
    }
    .stat-info h3 {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0 0 0.25rem 0;
    }
    .value {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-primary);
    }
  `]
})
export class HomeComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
  }

}
