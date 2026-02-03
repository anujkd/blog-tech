import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import FS from '@isomorphic-git/lightning-fs';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.css'
})
export class FileExplorerComponent {
  repoUrl: string = 'https://github.com/isomorphic-git/isomorphic-git';
  files: string[] = [];
  loading: boolean = false;
  error: string | null = null;
  fs: any;

  constructor() {
    this.initFS();
  }

  initFS() {
    this.fs = new FS('fs');
  }

  async fetchFiles() {
    this.loading = true;
    this.error = null;
    this.files = [];

    const dir = `/repo_${Date.now()}`;

    try {
      await this.fs.promises.mkdir(dir);

      await git.clone({
        fs: this.fs,
        http,
        dir,
        url: this.repoUrl,
        corsProxy: 'http://localhost:9999/',
        singleBranch: true,
        depth: 1
      });

      this.files = await git.listFiles({
        fs: this.fs,
        dir,
      });

    } catch (err: any) {
      console.error('Error fetching files:', err);
      this.error = `Failed to fetch files: ${err.message}`;
    } finally {
      this.loading = false;
    }
  }
}
