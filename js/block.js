$(function() {
    var next_color, before_color, player_color, enemy_color;
    // 石のおける範囲を取得するためのリストを宣言
    var can_set_stone = [],
        sround_stone_array = [];
    // 待ち時間の設定
    var settime_seconds = 800;
    // スキップカウントの初期設定
    var player_skip = 0,
        enemy_skip = 0;
    // ゲームが終了したかどうかの判定の初期設定
    var game_set = false;

    // 先攻/後攻の選択ポップアップを表示
    selectPlayerPopup();

    function changeTurn(color) {
        /**
         * @param {String} color 石の色
         * 今のターンを相手のターンに切り替える。
         **/
        updateScores(game_set);
        if (game_set) {
            return;
        }
        getReady(color);
        if (!can_set_stone.length) {
            // skipTurnを1度実行済みの場合、待ち時間を0で実行する
            if (player_skip || enemy_skip) {
                settime_seconds = 0;
            }
            setTimeout(skipTurn, settime_seconds, color);
            return;
        }
        if (player_skip || enemy_skip) {
            // スキップカウントを初期化
            player_skip = 0, enemy_skip = 0;
            alert(before_color + 'のターンで石を置くことができないため' + next_color + 'のターンにスキップします。\n\nPlay passes back to ' + next_color + ' because ' + before_color + ' cannot make a valid move.');
        }
        // 敵のターンになった場合、敵のターンを実行する
        if (color === enemy_color) {
            setTimeout(autoEnemyPlay, settime_seconds, enemy_color);
        }
    }

    function skipTurn(color) {
        /**
         * @param {String} color 石の色
         * 石が置けないため、次のターンにスキップする。
         **/
        before_color = color;
        next_color = before_color === player_color ? enemy_color : player_color;
        before_color === player_color ? player_skip++ : enemy_skip++;
        // 両者石が置けなくなったら、その場で勝敗を決定する。
        if (player_skip && enemy_skip) {
            alert('白と黒の両方のターンで石を置くことができないため、ゲームを終了します。\n\nThe game ends because neither player can move.');
            updateScores(true);
            return;
        }
        changeTurn(next_color);
    }

    function getReady(color) {
        /**
         * @param {String} color 石の色
         * プレイヤーもしくは敵の石を置ける範囲を取得する。
         **/
        // 石のおける範囲を取得するためのリストを初期化
        can_set_stone = [], sround_stone_array = [];
        // empty_hintをemptyに戻す
        $('div.empty_hint').attr('class', 'empty');

        // 空のマスのうち、実際におくことができる範囲を取得
        $('div.empty').each(function(index) {
            var this_empty_index = $(this).data('index');
            // 左右上下斜めの範囲を取得するためのリストを宣言
            var left_max = [],
                left_top_max = [],
                top_max = [],
                right_top_max = [],
                right_max = [],
                right_bottom_max = [],
                bottom_max = [],
                left_bottom_max = [];

            // クリックしたブロックの上下左右斜めの範囲のindexを取得する
            getMaxRange(left_max, -1);
            getMaxRange(left_top_max, -11);
            getMaxRange(top_max, -10);
            getMaxRange(right_top_max, -9);
            getMaxRange(right_max, 1);
            getMaxRange(right_bottom_max, 11);
            getMaxRange(bottom_max, 10);
            getMaxRange(left_bottom_max, 9);

            // クリックした場所に石を置けるかどうか判定する
            checkArray(left_max);
            checkArray(left_top_max);
            checkArray(top_max);
            checkArray(right_top_max);
            checkArray(right_max);
            checkArray(right_bottom_max);
            checkArray(bottom_max);
            checkArray(left_bottom_max);

            function getMaxRange(array, num) {
                /**
                 * @param {Array} array リスト（左右上下斜めのリストがわたってくる）
                 * @param {Number} num 加算・減算で使用する数字
                 * クリックしたブロックの上下左右斜めの範囲のindexを取得して、
                 * それぞれのArrayに格納する。
                 **/
                for (var i = 1; i < 6; i++) {
                    var surround_index = this_empty_index + i * num;
                    if (7 < surround_index / 10 || surround_index / 10 < 1 || surround_index % 10 < 1 || 6 < surround_index % 10) {
                        break;
                    }
                    array.push(surround_index);
                }
            }

            function checkArray(check_array) {
                /**
                 * @param {Array} check_array チェック対象リスト（左右上下斜めのリストがわたってくる）
                 * 左右上下斜めのリストから、置けるかどうか判定する。
                 * 空か、自分の色に挟まれていない場合は石が置けないため、チェック対象外。
                 * 石が置ける場合は、中に挟まれている石のindexをsround_stone_arrayに追加する。
                 **/
                for (i = 0; i < check_array.length; i++) {
                    //配置済み石を取得
                    var placed_stone = $('[data-index~="' + check_array[i] + '"]');
                    if (i === 0) {
                        //１つ目のマスの処理
                        if (placed_stone.attr('class') === 'empty' || placed_stone.attr('class') === color) {
                            //石がない、もしくは自分の石がある場合はチェック対象外
                            break;
                        }
                    } else {
                        //2つ目以降のマスの処理
                        if (placed_stone.attr('class') === 'empty') {
                            // 石がない場合は、チェック対象外
                            break;
                        }
                        if (placed_stone.attr('class') === color) {
                            // 自分の色に挟まれていれば、OK判定
                            can_set_stone.push(this_empty_index)
                            // 挟まれた内側の石の色を反転する
                            var sround_stone = [];
                            while (--i >= 0) {
                                sround_stone.push(check_array[i]);
                            }
                            var sround_index = sround_stone_array.length || 0;
                            sround_stone_array[sround_index] = sround_stone;
                            break;
                        }
                    }
                }
            }
        });
        if (color === player_color) {
            // 石をおける範囲を黄色く表示する
            $.each(can_set_stone, function(index, val) {
                $('[data-index~="' + val + '"]').attr('class', 'empty_hint');
            });
        }
    }

    function autoEnemyPlay(enemy_color) {
        /**
         * @param {String} enemy_color 敵のカラー
         * 敵のターンを実行する
         **/
        // ランダムにindexを抽出する
        var random_num = Math.floor(Math.random() * can_set_stone.length)
        var this_index = can_set_stone[random_num];
        // 抽出された場所の石を反転させる
        $('[data-index~="' + this_index + '"]').attr('class', enemy_color);

        // ランダムに抽出した場所が、can_set_stoneの何番目に入っているかを取得し、surround_indexiesにセットする
        var surround_indexies = [];
        for (var i = -1; i < can_set_stone.length - 1; i++) {
            var result = can_set_stone.indexOf(this_index, i + 1);
            if (result === -1) {
                break;
            }
            surround_indexies.push(result);
        }
        // 挟まれた内側の石の色をすべて反転する
        $.each(surround_indexies, function(i, num) {
            $.each(sround_stone_array[num], function(index, val) {
                $('[data-index~="' + val + '"]').attr('class', enemy_color);
            });
        });
        // プレイヤーのターンに切り替える
        changeTurn(player_color);
    }

    function updateScores(gameSet) {
        /**
         * @param {Boolean} gameSet ゲーム終了かどうか
         * スコアのカウントを更新し、ゲームが終了した場合はポップアップを表示する
         **/
        var white_count = $('.white').length,
            black_count = $('.black').length;
        $('.cnt_white').text(white_count);
        $('.cnt_black').text(black_count);
        // ゲームが終了したらポップアップを表示する
        if (gameSet || white_count + black_count === 36) {
            game_set = true;
            white_count === black_count ? showDrawPopup() : showConglatsPopup();
        }
    }

    // 先攻/後攻をクリックしたとき
    $('.attack').click(function() {
        $('#new_game').removeClass('is-show');
        player_color = $(this).data('player-color')
        enemy_color = player_color === 'white' ? 'black' : 'white'
        var player_color_text = player_color === 'white' ? '白' : '黒'
        if (player_color === 'white') {
            getReady(player_color);
            return;
        }
        // 後攻を選択した場合、敵のターンを実行する
        $('p.player_color>span').text(player_color_text);
        changeTurn(enemy_color);
    });

    // ブロックをクリックしたとき
    $('[id="block"]').click(function() {
        var this_index = $(this).data('index');
        // クリックしたブロックに石が置けない場合は、何もしない
        if ($(this).attr('class') !== 'empty_hint' || !can_set_stone.includes(this_index)) {
            return;
        }
        // クリックした場所がcan_set_stoneの何番目に入っているかを取得する
        var surround_indexies = [];
        for (var i = -1; i < can_set_stone.length - 1; i++) {
            var result = can_set_stone.indexOf(this_index, i + 1);
            if (result === -1) {
                break;
            }
            surround_indexies.push(result);
        }
        // 挟まれた内側の石の色をすべて反転する
        $.each(surround_indexies, function(i, num) {
            $.each(sround_stone_array[num], function(index, val) {
                $('[data-index~="' + val + '"]').attr('class', player_color);
            });
        });
        //　クリックしたところにオセロを置く
        $(this).attr('class', player_color);
        // 相手のターンに切り替える
        changeTurn(enemy_color);
    });
});
