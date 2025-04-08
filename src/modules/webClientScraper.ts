import { Github } from './github.js';
import { config } from '../core/config.js';
import { getAsset } from '../utils/downloadManager.js';
import { clearPath } from '../utils/fileManager.js';
import { existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';

export class WebClientScraper {
    async start() {
        await this.downloadAssets();
        await this.deployChanges();

        clearPath(`./${config.process_path}`);
    }

    async downloadAssets() {
        await getAsset('index.html', undefined, `./${config.process_path}`, 'html');
        await getAsset('sw.js', 'sw.js', `./${config.process_path}`, 'js');

        if (!['index.html', 'sw.js'].every(file => existsSync(join(`./${config.process_path}`, file)))) {
            process.exit();
        }
    }

    async deployChanges() {
        const git = new Github();
        
        git.clone(`${config.github.repos_owner}/${config.github.output_repo}`);

        cpSync(`./${config.process_path}`, `./${config.github.output_repo}`, { recursive: true, force: true });

        if (config.deploy_on_github) {
            git.commit('🖥️ Web Update', `${config.github.output_repo}`);
        }
    }
}
