import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { PositionsService } from 'src/app/shared/services/positions.services';
import { Position } from '../../../shared/interfaces';
import { MaterialService, MaterialInstance } from './../../../shared/classes/material.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.css']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('categoryId') categoryId: string;
  @ViewChild('modal') modalRef: ElementRef;

  form: FormGroup;
  positions: Position[] = [];
  loading = false;
  modal: MaterialInstance;
  positionId = null;

  constructor(private positionService: PositionsService) { }

  ngOnInit() {

    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(1, [Validators.required, Validators.min(1)])
    });

    this.loading = true;
    this.positionService.fetch(this.categoryId).subscribe(positions => {
      this.positions = positions;
      this.loading = false;
    });
  }
  ngAfterViewInit() {
  this.modal = MaterialService.initModal(this.modalRef);
  }
  ngOnDestroy() {
    this.modal.destroy();
  }
  onSelectPosition(position) {
    this.positionId = position._id;
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    })
    this.modal.open();
    MaterialService.updateTextInputs();
  }
  onAddPosition() {
    this.positionId = null;
    this.form.reset({
      name: null,
      cost: 1
    })
    this.modal.open();
    MaterialService.updateTextInputs();
  }
  onDeletePosition(position) {

  }
  onCancel() {
    this.modal.close();
  }
  onSubmit() {
    // this.form.disabled();

    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    };

    if (this.positionId) {
      newPosition._id = this.positionId;
      this.positionService.update(newPosition).subscribe(
        position => {
          MaterialService.toast('Позиция создана');
          this.positions.push(position);
        },
        error => {
          this.form.enable();
          MaterialService.toast(error.error.message);
        },
        () => {
          this.modal.close();
          this.form.reset({name: '', cost: 1});
          this.form.enable();
        }
      )
    } else {
      this.positionService.create(newPosition).subscribe(
        position => {
          MaterialService.toast('Позиция создана');
          this.positions.push(position);
        },
        error => {
          this.form.enable();
          MaterialService.toast(error.error.message);
        },
        () => {
          this.modal.close();
          this.form.reset({name: '', cost: 1});
          this.form.enable();
        }
      )
    }
  }
}
