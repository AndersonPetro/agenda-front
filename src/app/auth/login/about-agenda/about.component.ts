import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../../core/integration/service.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private serviceService = inject(ServiceService);

  availableServices: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.fetchDataFromAgendaService();
  }

  fetchDataFromAgendaService() {
    this.isLoading = true;
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.availableServices = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar dados do agenda-service', err);
        this.isLoading = false;
      }
    });
  }
}
