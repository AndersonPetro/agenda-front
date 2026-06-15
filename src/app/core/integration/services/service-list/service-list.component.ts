import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../../service.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>{{ isAdmin ? 'Gerenciamento de Serviços' : 'Serviços Disponíveis' }}</h2>
        <p class="subtitle">{{ isAdmin ? 'Adicione ou remova serviços disponíveis na clínica.' : 'Confira os serviços oferecidos e agende o seu atendimento.' }}</p>
      </div>
      <button *ngIf="isAdmin" class="btn-primary" (click)="toggleForm()">{{ showForm ? 'Cancelar' : 'Novo Serviço' }}</button>
    </div>

    <div *ngIf="showForm && isAdmin" class="glass-card mb-4 slide-down">
      <h3>Adicionar Novo Serviço</h3>
      <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group half">
            <label>Nome do Serviço</label>
            <input type="text" formControlName="name" placeholder="Ex: Consulta Geral">
          </div>
          <div class="form-group half">
            <label>Valor (R$)</label>
            <input type="number" formControlName="price" placeholder="150.00">
          </div>
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea formControlName="description" rows="2" placeholder="Descreva o serviço..."></textarea>
        </div>
        <div class="form-group">
          <label>Duração (minutos)</label>
          <input type="number" formControlName="durationMinutes" placeholder="30">
        </div>
        <button type="submit" class="btn-primary" [disabled]="serviceForm.invalid || isSubmitting">
          {{ isSubmitting ? 'Salvando...' : 'Salvar Serviço' }}
        </button>
      </form>
    </div>

    <div class="services-grid">
      <div *ngIf="isLoading" class="loading">Carregando serviços...</div>
      <div *ngIf="!isLoading && services.length === 0" class="empty-state">
        Nenhum serviço cadastrado ainda.
      </div>
      
      <div class="service-card glass-card" *ngFor="let service of services">
        <div class="service-header">
          <h4>{{ service.name }}</h4>
          <span class="price">R$ {{ service.price }}</span>
        </div>
        <p class="description">{{ service.description }}</p>
        <div class="service-footer">
          <span class="duration">⏱ {{ service.durationMinutes }} min</span>
          <button *ngIf="isAdmin" class="btn-icon delete" (click)="deleteService(service.id)" title="Remover">
            Excluir
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .page-header h2 { font-size: 1.8rem; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }
    .mb-4 { margin-bottom: 2rem; }
    
    .form-row { display: flex; gap: 1.5rem; }
    .half { flex: 1; }
    
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .service-card {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .service-header h4 { margin: 0; font-size: 1.2rem; }
    .price { font-weight: bold; color: var(--success); font-size: 1.2rem; }
    .description { color: var(--text-secondary); flex-grow: 1; margin-bottom: 1.5rem; }
    .service-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
    }
    .duration { color: var(--text-secondary); font-size: 0.875rem; }
    .btn-icon.delete {
      background: transparent;
      color: var(--danger);
      padding: 0.5rem;
      font-size: 0.875rem;
    }
    .btn-icon.delete:hover {
      background: rgba(239, 68, 68, 0.1);
      border-radius: 0.25rem;
    }
    .slide-down { animation: slideDown 0.3s ease-out; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ServiceListComponent implements OnInit {
  private serviceService = inject(ServiceService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  services: any[] = [];
  isLoading = true;
  showForm = false;
  isSubmitting = false;
  isAdmin = false;

  serviceForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0)]],
    durationMinutes: ['', [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.serviceForm.reset();
  }

  onSubmit() {
    if (this.serviceForm.valid) {
      this.isSubmitting = true;
      this.serviceService.createService(this.serviceForm.value).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toggleForm();
          this.loadServices();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  deleteService(id: string) {
    if (confirm('Tem certeza que deseja desativar/excluir este serviço?')) {
      this.serviceService.deleteService(id).subscribe({
        next: () => this.loadServices()
      });
    }
  }
}
