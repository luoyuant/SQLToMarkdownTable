// module.exports = {
//     //基本路径
// 	//设置为./本地发布file协议
// 	//
//     publicPath: "./",
// 	runtimeCompiler: true,
//     //文件名哈希
//     filenameHashing: true,
// 	chainWebpack: config => {

// 	},
// }

import {
	defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	plugins: [vue()]
})
