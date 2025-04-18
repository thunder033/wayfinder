import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WfCoreComponent } from './wf-core.component';

describe('WfCoreComponent', () => {
  let component: WfCoreComponent;
  let fixture: ComponentFixture<WfCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WfCoreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WfCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
