import { Component } from '@angular/core';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';

@Component({
  selector: 'app-root',
  imports: [FileExplorerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'github-file-explorer';
}
