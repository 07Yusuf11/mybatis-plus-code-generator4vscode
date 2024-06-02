// esbuild.config.js

const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['extension.js'], // 你的入口文件路径
  bundle: true,
  outdir: 'dist', // 输出目录
  platform: 'node', // 平台是 node
  external: ['vscode', 'freemarker'], // 排除 vscode 模块
  sourcemap: true, // 生成 sourcemap
  minify: false, // 如果需要压缩，设置为 true
  format: 'cjs',
  target: 'es2022'
}).catch(() => process.exit(1));
