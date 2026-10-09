package com.gaspare.zombiesurvival;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public class MainActivity extends Activity {
    private static final String TAG = "ZombieSurvival";
    private static final String CRASH_FILE = "last_crash.txt";
    private FrameLayout root;
    private WebView web;
    private WebViewAssetLoader assets;
    private boolean pageReady;

    /** Runs before page scripts on this personal build only. */
    private static final String BOOT_JS =
            "window.__ZS_ANDROID=1;window.__zsApk=1;window.__ZS_OWNER=1;";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        installCrashHandler();
        super.onCreate(savedInstanceState);
        // window flags only (safe before the content view exists)
        try {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
            if (Build.VERSION.SDK_INT >= 28) {
                WindowManager.LayoutParams lp = getWindow().getAttributes();
                lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                getWindow().setAttributes(lp);
            }
        } catch (Throwable t) {
            Log.e(TAG, "window flags", t);
        }
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        setContentView(root);
        // fullscreen only after the decor view exists (getInsetsController() before setContentView crashed 4.3.78)
        applyFullscreen();
        String crash = readCrash();
        try {
            assets = new WebViewAssetLoader.Builder()
                    .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this))
                    .build();
            createWebView();
        } catch (Throwable t) {
            Log.e(TAG, "webview", t);
            showText("Impossibile avviare il gioco (WebView).\nAggiorna \"Android System WebView\" / Chrome dal Play Store e riprova.\n\n" + stack(t));
            return;
        }
        if (crash != null) showText("L'app si era chiusa per un errore. Fai uno screenshot e mandalo a Gaspare:\n\n" + crash);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView() {
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assets.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
                try { view.evaluateJavascript(BOOT_JS, null); } catch (Throwable t) { Log.e(TAG, "boot js", t); }
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // the page renderer died (e.g. out of GPU memory): rebuild it instead of killing the app
                Log.e(TAG, "renderer gone");
                try {
                    root.removeView(view);
                    view.destroy();
                } catch (Throwable ignored) { }
                web = null;
                pageReady = false;
                try { createWebView(); } catch (Throwable t) { showText("Errore del motore grafico (WebView).\n\n" + stack(t)); }
                return true;
            }
        });
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(web, BOOT_JS, Collections.singleton("*"));
        }
        web.loadUrl("https://appassets.androidplatform.net/index.html?apk=1");
    }

    // ---------- fullscreen (defensive: every step in try/catch, decor view forced first) ----------
    private void applyFullscreen() {
        Window w = getWindow();
        View decor;
        try {
            decor = w.getDecorView();
        } catch (Throwable t) {
            Log.e(TAG, "decor", t);
            return;
        }
        try {
            decor.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        } catch (Throwable t) {
            Log.e(TAG, "legacy immersive", t);
        }
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                w.setDecorFitsSystemWindows(false);
                WindowInsetsController c = decor.getWindowInsetsController();
                if (c != null) {
                    c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            } catch (Throwable t) {
                Log.e(TAG, "insets controller", t);
            }
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applyFullscreen();
    }

    @Override
    protected void onResume() {
        super.onResume();
        try { if (web != null) web.onResume(); } catch (Throwable ignored) { }
        applyFullscreen();
    }

    @Override
    protected void onPause() {
        try { if (web != null) web.onPause(); } catch (Throwable ignored) { }
        super.onPause();
    }

    @Override
    public void onBackPressed() {
        if (web == null || !pageReady) {
            moveTaskToBack(true);
            return;
        }
        try {
            web.evaluateJavascript("(function(){try{return window.__zsBack&&window.__zsBack()?1:0;}catch(e){return 0;}})()", value -> {
                if (!"1".equals(value)) moveTaskToBack(true);
            });
        } catch (Throwable t) {
            moveTaskToBack(true);
        }
    }

    // ---------- crash safety net: save the stack trace, show it on the next launch ----------
    private void installCrashHandler() {
        final Thread.UncaughtExceptionHandler prev = Thread.getDefaultUncaughtExceptionHandler();
        final Context app = getApplicationContext();
        Thread.setDefaultUncaughtExceptionHandler((th, ex) -> {
            try {
                String txt = "Zombie Survival " + BuildConfigInfo.version(app) + "\nAndroid " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ") "
                        + Build.MANUFACTURER + " " + Build.MODEL + "\nThread: " + th.getName() + "\n\n" + stack(ex);
                try (FileOutputStream o = new FileOutputStream(new File(app.getFilesDir(), CRASH_FILE))) {
                    o.write(txt.getBytes(StandardCharsets.UTF_8));
                }
            } catch (Throwable ignored) { }
            if (prev != null) prev.uncaughtException(th, ex);
            else System.exit(2);
        });
    }

    private String readCrash() {
        try {
            File f = new File(getFilesDir(), CRASH_FILE);
            if (!f.exists()) return null;
            byte[] b = new byte[(int) Math.min(f.length(), 20000)];
            int n;
            try (FileInputStream in = new FileInputStream(f)) { n = in.read(b); }
            f.delete();
            return n > 0 ? new String(b, 0, n, StandardCharsets.UTF_8) : null;
        } catch (Throwable t) {
            return null;
        }
    }

    private void showText(final String msg) {
        try {
            TextView tv = new TextView(this);
            tv.setText(msg);
            tv.setTextIsSelectable(true);
            tv.setTextSize(12);
            tv.setPadding(32, 24, 32, 24);
            ScrollView sv = new ScrollView(this);
            sv.addView(tv);
            new AlertDialog.Builder(this)
                    .setTitle("Zombie Survival · errore")
                    .setView(sv)
                    .setPositiveButton("OK", null)
                    .setNeutralButton("Copia", (d, i) -> {
                        try {
                            ClipboardManager cm = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                            if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("crash", msg));
                        } catch (Throwable ignored) { }
                    })
                    .show();
        } catch (Throwable t) {
            Log.e(TAG, "dialog", t);
        }
    }

    private static String stack(Throwable t) {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));
        String s = sw.toString();
        return s.length() > 12000 ? s.substring(0, 12000) : s;
    }

    /** versionName without needing BuildConfig. */
    static final class BuildConfigInfo {
        static String version(Context c) {
            try {
                return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionName;
            } catch (Throwable t) {
                return "?";
            }
        }
    }
}
