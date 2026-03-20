<script>
    import { supabase } from "$lib/supabase.js";
    let isLogin = true;
    let email = "",
        password = "",
        loading = false,
        errorMsg = "",
        successMsg = "";

    async function handleSubmit() {
        loading = true;
        errorMsg = "";
        successMsg = "";
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                window.location.href = "/";
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                successMsg = "Check your email to confirm your account!";
            }
        } catch (e) {
            errorMsg = e.message || "Something went wrong";
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head
    ><title>{isLogin ? "Login" : "Sign Up"} — AI Brand Builder</title
    ></svelte:head
>

<div class="flex items-center justify-center h-screen w-screen bg-bg">
    <div
        class="w-full max-w-[400px] bg-panel border border-border rounded-xl p-8"
    >
        <h1 class="text-xl font-bold text-primary mb-1">AI Brand Builder</h1>
        <p class="text-sm text-muted mb-6">
            {isLogin ? "Sign in to your workspace" : "Create a new account"}
        </p>

        {#if errorMsg}<div
                class="mb-4 p-3 rounded-lg bg-accent/10 text-accent text-sm border border-accent/20"
            >
                {errorMsg}
            </div>{/if}
        {#if successMsg}<div
                class="mb-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm border border-green-200"
            >
                {successMsg}
            </div>{/if}

        <form
            on:submit|preventDefault={handleSubmit}
            class="flex flex-col gap-4"
        >
            <div class="flex flex-col gap-1.5">
                <label for="email" class="text-xs font-semibold text-secondary"
                    >Email</label
                >
                <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    bind:value={email}
                    required
                    class="px-3 py-2.5 rounded-md border border-border bg-white text-primary font-sans text-sm focus:outline-none focus:border-accent/40"
                />
            </div>
            <div class="flex flex-col gap-1.5">
                <label
                    for="password"
                    class="text-xs font-semibold text-secondary">Password</label
                >
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    bind:value={password}
                    required
                    minlength="6"
                    class="px-3 py-2.5 rounded-md border border-border bg-white text-primary font-sans text-sm focus:outline-none focus:border-accent/40"
                />
            </div>
            <button
                type="submit"
                class="btn-primary w-full py-2.5 mt-2"
                disabled={loading}
                >{loading
                    ? "Please wait..."
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}</button
            >
        </form>

        <div class="mt-6 text-center">
            <button
                class="text-sm text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                on:click={() => {
                    isLogin = !isLogin;
                    errorMsg = "";
                    successMsg = "";
                }}
            >
                {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
            </button>
        </div>
    </div>
</div>
