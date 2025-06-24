"use client";
import React from 'react';

interface WordData {
    id: string;
    word: string;
    isNumeric?: boolean; // 新增字段，标记是否为数字命题
    hints: {
        en: string;
        jp: string;
        es: string;
        emoji: string;
        root: string;
        association: string;
        svg: React.FC | null; // 可以是null，如果isNumeric为true，则渲染NumberSVG
    };
}

export const wordDatabase: WordData[] = [
    {
        id: 'apple',
        word: '苹果',
        isNumeric: false,
        hints: {
            en: 'apple',
            jp: 'りんご',
            es: 'manzana',
            emoji: '🍎',
            root: '词根: ap-, 来自原始印欧语 *ab(e)l-, 意为“多汁的果实”。',
            association: '联想: 牛顿与万有引力，白雪公主与毒苹果，乔布斯的苹果公司。',
            svg: () => (
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M78.9,63.4C79.4,50.3,70,43,62,42.8c-7.2,0-10.4,4.2-13.1,4.2s-5.6-4.2-12.8-4.2c-9.2,0-17.8,6.7-18.4,18.3 c0,0.3,0,0.5,0,0.8C17.5,74.1,20.2,88,27.9,88c2.9,0,5.6-2,8.4-2s5.3,2,8.7,2c3.4,0,5.6-2,8.4-2s5.6,2,8.4,2 C69.2,88,72.7,76.5,72.7,69C72.7,67.3,78.9,63.4,78.9,63.4z" fill="#FF4B4B"/>
                    <path d="M62.9,28.6c2.8-3.4,4.2-8.1,3.7-12.8c-4.2,0.3-8.9,3.1-11.7,6.5c-2.5,3.1-4.2,7.8-3.7,12.5 C55.4,35.1,60.1,32.3,62.9,28.6z" fill="#6ABF4B"/>
                </svg>
            ),
        }
    },
    {
        id: 'window',
        word: '窗户',
        isNumeric: false,
        hints: {
            en: 'window',
            jp: '窓',
            es: 'ventana',
            emoji: '🪟',
            root: '词根: wind-, 来自古诺尔斯语 vindauga，意为“风眼”。',
            association: '联想: 电脑的Windows操作系统，窗明几净，打开窗户呼吸新鲜空气。',
            svg: () => <div className="text-4xl">🪟</div>,
        }
    },
    {
        id: 'fiction',
        word: '小说',
        isNumeric: false,
        hints: {
            en: 'fiction',
            jp: 'フィクション',
            es: 'ficción',
            emoji: '📚',
            root: '词根: fict-, 来自拉丁语 fictio，意为“形成，创造”。',
            association: '联想: 科幻小说，奇幻小说，虚构的故事，引人入胜的故事情节。',
            svg: () => <div className="text-4xl">📚</div>,
        }
    },
    {
        id: 'one',
        word: '1',
        isNumeric: true,
        hints: {
            en: 'one',
            jp: '一',
            es: 'uno',
            emoji: '1️⃣',
            root: '词根: uni-, 来自拉丁语 unus，意为“单一，独一”。',
            association: '联想: 第一，唯一，统一，一个。',
            svg: null, // 数字由NumberSVG组件渲染
        }
    },
    {
        id: 'two',
        word: '2',
        isNumeric: true,
        hints: {
            en: 'two',
            jp: '二',
            es: 'dos',
            emoji: '2️⃣',
            root: '词根: bi-, 来自拉丁语 bis，意为“两次”。',
            association: '联想: 第二，双胞胎，双数，两人。',
            svg: null,
        }
    },
     {
        id: 'three',
        word: '3',
        isNumeric: true,
        hints: {
            en: 'three',
            jp: '三',
            es: 'tres',
            emoji: '3️⃣',
            root: '词根: tri-, 来自拉丁语 tres，意为“三”。',
            association: '联想: 第三，三角形，三叶草，三原色。',
            svg: null,
        }
    }
];

export interface WordSensationAssociativeImaginationWords {
    Word: string;
    AssociativeImaginationWords: string;
}

// 暂时注释掉，因为doptime-client的引入和使用在此次迭代中不是核心
// import { newApi } from "doptime-client";
// export const apiWordSensationAssociativeImagination = new newApi<string[], WordSensationAssociativeImaginationWords[]>();
