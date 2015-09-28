/*!
 * index.js
 */
(function () {
    'use strict';

    var tweetUrlPattern = new RegExp('^(https://twitter.com/[_0-9a-zA-Z]+/status/[0-9]+)');

    var tweetUrlBase = 'https://twitter.com/intent/tweet?lang=ja&text=';

    var getTweetCountBase = 'http://urls.api.twitter.com/1/urls/count.json?url=';
    var getTweetListBase  = 'https://twitter.com/search?q=';

    var imageUrlMark = '[スタンプ画像URL]';

    var defaultTweetText = '\r' + imageUrlMark;

    var timeoutSeconds = 10;

    var twitterPicUrl = '';
    var twitterPbsUrl = '';

    // debug
    /*
    twitterPicUrl = 'pic.twitter.com/zJf9UxVkCy';
    twitterPbsUrl = 'https://pbs.twimg.com/media/Bz_MBtjCEAAAPqr.png';
    makeTweetImage();
    $('#tweetButtonImage').val(twitterPbsUrl);
    $('#tweetUrl').val('https://twitter.com/rgx_6/status/522360412960862209/');
    */

    initTweetText();

    $('#tweetUrl').on('change', function () {
        'use strict';
        // console.log('#tweetUrl change');

        $('#getTweet').attr('disabled', false);

        $('#tweetImageArea').empty();
        resetTweetButtonDesign();
        resetTweetButtonTag();
    });

    $('#getTweet').on('click', function () {
        'use strict';
        // console.log('#getTweet click');

        var url = $('#tweetUrl').val();

        if (url == null || url == '') return;

        var match = tweetUrlPattern.exec(url);
        if (match == null) {
            alert('不正なURLです。\n'
                  + 'URLを確認してください。');
            return;
        }

        url = match[0];

        startBlockUI();

        $.ajax({
            type:        'POST',
            url:         '/tweeturl',
            contentType: 'application/json',
            data:        JSON.stringify({ tweetUrl: url }),
            dataType:    'json',
            cache:       false,
            timeout:     timeoutSeconds * 1000,
            success: function (data) {
                twitterPicUrl = data.twitterPicUrl;
                twitterPbsUrl = data.twitterPbsUrl;

                makeTweetImage();

                $('#tweetButtonImage').val(twitterPbsUrl);

                $('#getTweet').attr('disabled', true);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var res = parseJson(XMLHttpRequest.responseText);
                if (XMLHttpRequest.status == 400) {
                    alert('不正なURLです。\n'
                          + 'URLを確認してください。');
                } else if (res && res.reason == 404) {
                    alert('ツイートを取得できませんでした。\n'
                          + 'URLが正しいか確認してください。');
                } else {
                    alert('ツイートを取得できませんでした。\n'
                          + 'しばらく時間をおいてもう一度試してください。');
                }
            },
            complete: function () {
                $.unblockUI();
            }
        });
    });

    $('#makeTweetButtonTag').on('click', function () {
        'use strict';
        // console.log('#makeTweetButtonTag click');

        makeTweetButtonTag();
    });

    var trimTarget = '#tweetUrl'
                    + ', #tweetButtonImage, #tweetButtonBackgroundColor, #tweetButtonBorderColor';
    $(trimTarget).on('change', function () {
        'use strict';
        // console.log('#' + this.id + ' change');

        $(this).val($(this).val().trim());
    });

    var watchTarget = '#tweetText'
                    + ', #tweetButtonImage, #tweetButtonImageWidth, #tweetButtonImageHeight'
                    + ', #tweetButtonBackgroundColor'
                    + ', #tweetButtonBorderWidth, #tweetButtonBorderColor, #tweetButtonBorderRadius';
    $(watchTarget).on('change', function () {
        'use strict';
        // console.log('#' + this.id + ' change');

        makeTweetButton();
        resetTweetButtonTag();
    });

    $('#tweetText').on('change', function () {
        'use strict';
        // console.log('#tweetText  change');

        var text = $(this).val();
        if (!text.contains(imageUrlMark)) $(this).val(text + '\r' + imageUrlMark);

        saveTweetText();
    });

    function initTweetText () {
        'use strict';
        // console.log('initTweetText');

        var text = loadTweetText();
        if (text == '') text = defaultTweetText;
        else if (!text.contains(imageUrlMark)) text += '\r' + imageUrlMark;

        $('#tweetText').text(text);
    }

    function makeTweetImage () {
        'use strict';
        // console.log('makeTweetImage');

        var img = $('<img />');

        img.on('load', function () {
            var imageWidth = $(this).width();
            var imageHeight = $(this).height();
            $('#tweetButtonImageWidth').val(imageWidth);
            $('#tweetButtonImageHeight').val(imageHeight);

            makeTweetButton();
        });

        img.attr('src', twitterPbsUrl);

        $('#tweetImageArea').empty();
        $('#tweetImageArea').append(img);
    }

    function makeTweetButton () {
        'use strict';
        // console.log('makeTweetButton');

        // ツイートURL生成

        var tweetText = $('#tweetText').val()
                .replace(/\n/g, '\r')
                .replace(imageUrlMark, twitterPicUrl);

        var tweetUrl = tweetUrlBase + encodeURIComponent(tweetText);

        $('#tweetHref').val(tweetUrl);

        // ツイートボタン生成

        var imageUrl        = $('#tweetButtonImage').val();
        var width           = $('#tweetButtonImageWidth').val() - 0;
        var height          = $('#tweetButtonImageHeight').val() - 0;
        var backgroundColor = $('#tweetButtonBackgroundColor').val();
        var borderWidth     = $('#tweetButtonBorderWidth').val() - 0;
        var borderColor     = $('#tweetButtonBorderColor').val();
        var borderRadius    = $('#tweetButtonBorderRadius').val() - 0;

        var a = $('<a></a>', {
            href:   tweetUrl,
            target: '_blank',
        });
        a.css('width', width + 2 * borderWidth + 'px');
        a.css('height', height + 2 * borderWidth + 'px');
        a.css('border-radius', borderRadius + 'px');
        a.css('display', 'block');

        var div = $('<div></div>');
        div.css('width', width + 'px');
        div.css('height', height + 'px');
        div.css('background-image', 'url("' + imageUrl + '")');
        div.css('background-position', 'center center');
        div.css('background-repeat', 'no-repeat');
        div.css('background-size', 'contain');
        div.css('background-color', backgroundColor);
        div.css('border', 'solid ' + borderWidth + 'px ' + borderColor);
        div.css('border-radius', borderRadius + 'px');
        div.css('box-sizing', 'content-box');

        a.append(div);

        $('#tweetButtonSampleArea').empty();
        $('#tweetButtonSampleArea').append(a);
    }

    function makeTweetButtonTag () {
        'use strict';
        // console.log('makeTweetButtonTag');

        var button = $('#tweetButtonSampleArea a');

        if (button.length == 0) return;

        $('#tweetButtonTag').val(button.get(0).outerHTML);

        var params = {
            text:     $('#tweetText').val(),
            tweetUrl: $('#tweetUrl').val(),
            imageUrl: twitterPicUrl,
        };

        $('#makeTweetButtonTag').attr('disabled', true);

        $.ajax({
            type:        'POST',
            url:         '/stampdata',
            contentType: 'application/json',
            data:        JSON.stringify(params),
            dataType:    'json',
            cache:       false,
            timeout:     5 * 1000,
            success: function (data) {
                console.log(data.result);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.error(textStatus);
            }
        });
    }

    function resetTweetButtonDesign () {
        'use strict';
        // console.log('resetTweetButtonDesign');

        $('#tweetButtonImage').val('');
        $('#tweetButtonImageWidth').val('');
        $('#tweetButtonImageHeight').val('');
        $('#tweetButtonSampleArea').empty();
    }

    function resetTweetButtonTag () {
        'use strict';
        // console.log('resetTweetButtonTag');

        $('#tweetButtonTag').val('');
        $('#makeTweetButtonTag').attr('disabled', false);
    }

    function saveTweetText () {
        'use strict';
        // console.log('saveTweetText');

        var tweetText = $('#tweetText').val();
        localStorage.setItem('tweetText', JSON.stringify(tweetText));
    };

    function loadTweetText () {
        'use strict';
        // console.log('loadTweetText');

        var tweetText = localStorage.getItem('tweetText') ?
                JSON.parse(localStorage.getItem('tweetText')) :
                '';

        return tweetText;
    }

    function startBlockUI () {
        'use strict';
        // console.log('startBlockUI');

        $.blockUI({ message: '<h3><img src="/images/spinner.gif" />ツイート取得中</h3>' });
    }

    function parseJson (data) {
        'use strict';
        // console.log('parseJson');

        var json = null;

        try {
            json = JSON.parse(data);
        } catch (e) {
            // do nothing
            console.log('json parse failed');
        }

        return json;
    }
})();
