import {
  Component,
  OnInit,
  forwardRef,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { UnitsService } from '../units.service';
import { UnitOfMeasure, UnitType, UNIT_TYPE_LABELS } from '../models/unit.model';

@Component({
  selector: 'app-unit-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UnitSelectComponent),
      multi: true,
    },
  ],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>{{ label() }}</mat-label>
      <mat-select
        [value]="value()"
        [disabled]="disabled()"
        (selectionChange)="onChange($event.value)"
        (blur)="onTouched()"
      >
        @for (unit of units(); track unit.id) {
          <mat-option [value]="unit.id">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ unit.name }}</span>
              <span class="text-xs text-slate-500 font-mono">({{ unit.abbreviation }})</span>
              <span class="text-xs text-slate-400 ml-auto">{{ unitTypeLabels[unit.type] }}</span>
            </div>
          </mat-option>
        }
      </mat-select>
      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }
    </mat-form-field>
  `,
})
export class UnitSelectComponent implements OnInit, ControlValueAccessor {
  private readonly unitsService = inject(UnitsService);

  readonly label = signal('Unidad de medida');
  readonly hint = signal<string>('');
  readonly units = signal<UnitOfMeasure[]>([]);
  readonly value = signal<string | null>(null);
  readonly disabled = signal(false);

  readonly unitTypeLabels = UNIT_TYPE_LABELS;

  private onChangeFn: (v: string | null) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    this.unitsService.listActive().subscribe({
      next: (units) => this.units.set(units),
      error: () => {},
    });
  }

  writeValue(v: string | null): void {
    this.value.set(v);
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onChange(v: string | null): void {
    this.value.set(v);
    this.onChangeFn(v);
  }
}