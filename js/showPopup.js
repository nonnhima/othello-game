function selectPlayerPopup() {
    /**
     * 先攻/後攻の選択
     **/
    var popup = $('#new_game');
    popup.addClass('is-show');
}

function showConglatsPopup() {
    /**
     * すべてのボードに石が埋まり勝敗が決まった場合、祝福ウィンドウを表示する
     **/
    var popup = $('#won_popup');
    var winner_color = $('.white').length > $('.black').length ? 'White' : 'Black';
    $('.winner_color').text(winner_color);
    $('.winner_img').children('img').attr('src', './img/' + winner_color.toLowerCase() + '.png');
    popup.addClass('is-show');
    closePopUp($('.js-black-bg'), popup);
    closePopUp($('.js-close-btn'), popup);
}

function showDrawPopup() {
    /**
     * すべてのボードに石が埋まり引き分けになった場合、引き分けウィンドウを表示する
     **/
    var popup = $('#draw_popup');
    popup.addClass('is-show');
    closePopUp($('.js-black-bg'), popup);
    closePopUp($('.js-close-btn'), popup);
}

function closePopUp(elem, popup) {
    /**
     * 閉じるボタンをクリックしたときの挙動
     **/
    if (!elem) return;
    elem.on('click', function() {
        popup.removeClass('is-show');
    })
}
